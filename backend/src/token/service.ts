import { RefreshToken } from '../db/models/RefreshToken';
import { User } from '../db/models/User';
import { config } from '../config';
import { UnauthorizedException } from '../common/exceptions';
import {
  buildAccessTokenClaims,
  buildRefreshTokenClaims,
  decodeToken,
  encodeToken,
  type TokenSchema,
} from './tokens';

export async function generateAuthTokens(userId: string): Promise<TokenSchema> {
  const refreshClaims = buildRefreshTokenClaims(userId);
  const accessClaims = buildAccessTokenClaims(refreshClaims);

  const tokens: TokenSchema = {
    access_token: encodeToken(accessClaims),
    refresh_token: encodeToken(refreshClaims),
  };

  await RefreshToken.create({
    token: tokens.refresh_token,
    expires_at: new Date(refreshClaims.exp * 1000),
    user_id: userId,
  });

  return tokens;
}

export async function revokeRefreshToken(refreshTokenValue: string): Promise<void> {
  await RefreshToken.updateOne(
    { token: refreshTokenValue, is_blacklisted: false },
    { $set: { is_blacklisted: true } },
  );
}

export async function refreshTokens(refreshTokenValue: string): Promise<TokenSchema> {
  const claims = decodeToken(refreshTokenValue);

  if (claims.type !== 'refresh') {
    throw new UnauthorizedException('invalid or expired token');
  }

  const user = await User.findById(claims.sub);
  if (!user) {
    throw new UnauthorizedException('invalid or expired token');
  }

  const record = await RefreshToken.findOne({ token: refreshTokenValue });
  if (!record) {
    throw new UnauthorizedException('invalid or expired token');
  }

  if (record.is_blacklisted) {
    throw new UnauthorizedException('Refresh token revoked');
  }

  if (record.expires_at && record.expires_at.getTime() < Date.now()) {
    throw new UnauthorizedException('invalid or expired token');
  }

  if (config.jwt.rotateRefreshToken) {
    record.is_blacklisted = true;
    await record.save();
  }

  return generateAuthTokens(user._id.toString());
}

export async function purgeExpiredRefreshTokens(): Promise<number> {
  const result = await RefreshToken.deleteMany({ expires_at: { $lt: new Date() } });
  return result.deletedCount ?? 0;
}
