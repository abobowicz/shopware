<?php declare(strict_types=1);

namespace Shopware\Tests\Unit\Core\Content\Flow\Dispatching\Action;

use PHPUnit\Framework\MockObject\MockObject;
use PHPUnit\Framework\TestCase;
use Shopware\Core\Content\Flow\Dispatching\Action\RemoveCustomerTagAction;
use Shopware\Core\Content\Flow\Dispatching\StorableFlow;
use Shopware\Core\Framework\DataAbstractionLayer\EntityRepository;
use Shopware\Core\Framework\Event\CustomerAware;
use Shopware\Core\Framework\Feature;
use Shopware\Core\Framework\Test\TestDataCollection;
use Shopware\Core\Framework\Uuid\Uuid;

/**
 * @package business-ops
 *
 * @internal
 * @covers \Shopware\Core\Content\Flow\Dispatching\Action\RemoveCustomerTagAction
 */
class RemoveCustomerTagActionTest extends TestCase
{
    /**
     * @var MockObject|EntityRepository
     */
    private $repository;

    private RemoveCustomerTagAction $action;

    /**
     * @var MockObject|StorableFlow
     */
    private $flow;

    public function setUp(): void
    {
        $this->repository = $this->createMock(EntityRepository::class);
        $this->action = new RemoveCustomerTagAction($this->repository);

        $this->flow = $this->createMock(StorableFlow::class);
    }

    public function testRequirements(): void
    {
        static::assertSame(
            [CustomerAware::class],
            $this->action->requirements()
        );
    }

    public function testSubscribedEvents(): void
    {
        if (Feature::isActive('v6.5.0.0')) {
            static::assertSame(
                [],
                RemoveCustomerTagAction::getSubscribedEvents()
            );

            return;
        }

        static::assertSame(
            ['action.remove.customer.tag' => 'handle'],
            RemoveCustomerTagAction::getSubscribedEvents()
        );
    }

    public function testName(): void
    {
        static::assertSame('action.remove.customer.tag', RemoveCustomerTagAction::getName());
    }

    /**
     * @param array<string, mixed> $config
     * @param array<string, mixed> $expected
     *
     * @dataProvider actionExecutedProvider
     */
    public function testActionExecuted(array $config, array $expected): void
    {
        $this->flow->expects(static::exactly(2))->method('getStore')->willReturn(Uuid::randomHex());
        $this->flow->expects(static::once())->method('hasStore')->willReturn(true);
        $this->flow->expects(static::once())->method('getConfig')->willReturn($config);

        $customerId = $this->flow->getStore(CustomerAware::CUSTOMER_ID);
        $withData = array_map(function ($id) use ($customerId) {
            return [
                'customerId' => $customerId,
                'tagId' => $id['id'],
            ];
        }, $expected);

        $this->repository->expects(static::once())
            ->method('delete')
            ->with($withData);

        $this->action->handleFlow($this->flow);
    }

    public function testActionWithNotAware(): void
    {
        $this->flow->expects(static::once())->method('hasStore')->willReturn(false);
        $this->flow->expects(static::never())->method('getStore');
        $this->repository->expects(static::never())->method('update');

        $this->action->handleFlow($this->flow);
    }

    public function testActionWithEmptyConfig(): void
    {
        $this->flow->expects(static::once())->method('hasStore')->willReturn(true);
        $this->flow->expects(static::exactly(1))->method('getStore')->willReturn(Uuid::randomHex());
        $this->flow->expects(static::once())->method('getConfig')->willReturn([]);
        $this->repository->expects(static::never())->method('update');

        $this->action->handleFlow($this->flow);
    }

    public function actionExecutedProvider(): \Generator
    {
        $ids = new TestDataCollection();

        yield 'Test with single tag' => [
            ['tagIds' => self::keys([$ids->get('tag-1')])],
            $ids->getIdArray(['tag-1']),
        ];

        yield 'Test with multiple tags' => [
            ['tagIds' => self::keys($ids->getList(['tag-1', 'tag-2']))],
            $ids->getIdArray(['tag-1', 'tag-2']),
        ];
    }

    /**
     * @param array<string> $ids
     *
     * @return array<string, mixed>
     */
    private static function keys(array $ids): array
    {
        $return = \array_combine($ids, \array_fill(0, \count($ids), true));

        static::assertIsArray($return);

        return $return;
    }
}
