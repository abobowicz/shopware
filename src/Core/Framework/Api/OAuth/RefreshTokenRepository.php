<?php declare(strict_types=1);

namespace Shopware\Core\Framework\Api\OAuth;

use Doctrine\DBAL\Connection;
use League\OAuth2\Server\Entities\RefreshTokenEntityInterface;
use League\OAuth2\Server\Repositories\RefreshTokenRepositoryInterface;
use Shopware\Core\Defaults;
use Shopware\Core\Framework\Uuid\Uuid;

/**
 * @package core
 */
class RefreshTokenRepository implements RefreshTokenRepositoryInterface
{
    /**
     * @var Connection
     */
    private $connection;

    /**
     * @internal
     */
    public function __construct(Connection $connection)
    {
        $this->connection = $connection;
    }

    /**
     * {@inheritdoc}
     */
    public function getNewRefreshToken(): RefreshTokenEntityInterface
    {
        return new RefreshToken();
    }

    /**
     * {@inheritdoc}
     */
    public function persistNewRefreshToken(RefreshTokenEntityInterface $refreshTokenEntity): void
    {
        $this->connection->createQueryBuilder()
            ->insert('refresh_token')
            ->values([
                'id' => ':id',
                'user_id' => ':userId',
                'token_id' => ':tokenId',
                'issued_at' => ':issuedAt',
                'expires_at' => ':expiresAt',
            ])
            ->setParameters([
                'id' => Uuid::randomBytes(),
                'userId' => Uuid::fromHexToBytes($refreshTokenEntity->getAccessToken()->getUserIdentifier()),
                'tokenId' => $refreshTokenEntity->getIdentifier(),
                'issuedAt' => (new \DateTime())->format(Defaults::STORAGE_DATE_TIME_FORMAT),
                'expiresAt' => $refreshTokenEntity->getExpiryDateTime()->format(Defaults::STORAGE_DATE_TIME_FORMAT),
            ])
            ->execute();

        $this->cleanUpExpiredRefreshTokens();
    }

    /**
     * {@inheritdoc}
     */
    public function revokeRefreshToken($tokenId): void
    {
        $this->connection->createQueryBuilder()
            ->delete('refresh_token')
            ->where('token_id = :tokenId')
            ->setParameter('tokenId', $tokenId)
            ->execute();

        $this->cleanUpExpiredRefreshTokens();
    }

    /**
     * {@inheritdoc}
     */
    public function isRefreshTokenRevoked($tokenId): bool
    {
        $refreshToken = $this->connection->createQueryBuilder()
            ->select(['token_id'])
            ->from('refresh_token')
            ->where('token_id = :tokenId')
            ->setParameter('tokenId', $tokenId)
            ->execute()
            ->fetch();

        $this->cleanUpExpiredRefreshTokens();

        // no token found, token is invalid
        if (!$refreshToken) {
            return true;
        }

        return false;
    }

    public function revokeRefreshTokensForUser(string $userId): void
    {
        $this->connection->createQueryBuilder()
            ->delete('refresh_token')
            ->where('user_id = UNHEX(:userId)')
            ->setParameter('userId', $userId)
            ->execute();
    }

    private function cleanUpExpiredRefreshTokens(): void
    {
        $now = (new \DateTime())->format(Defaults::STORAGE_DATE_TIME_FORMAT);

        $this->connection->createQueryBuilder()
            ->delete('refresh_token')
            ->where('expires_at < :now')
            ->setParameter('now', $now)
            ->execute();
    }
}
