<?php declare(strict_types=1);

namespace Shopware\Core\Content\LandingPage\DataAbstractionLayer;

use Shopware\Core\Content\LandingPage\Event\LandingPageIndexerEvent;
use Shopware\Core\Content\LandingPage\LandingPageDefinition;
use Shopware\Core\Framework\DataAbstractionLayer\Dbal\Common\IteratorFactory;
use Shopware\Core\Framework\DataAbstractionLayer\EntityRepository;
use Shopware\Core\Framework\DataAbstractionLayer\Event\EntityWrittenContainerEvent;
use Shopware\Core\Framework\DataAbstractionLayer\Indexing\EntityIndexer;
use Shopware\Core\Framework\DataAbstractionLayer\Indexing\EntityIndexingMessage;
use Shopware\Core\Framework\DataAbstractionLayer\Indexing\ManyToManyIdFieldUpdater;
use Shopware\Core\Framework\Feature;
use Shopware\Core\Framework\Plugin\Exception\DecorationPatternException;
use Symfony\Contracts\EventDispatcher\EventDispatcherInterface;

/**
 * @package content
 */
class LandingPageIndexer extends EntityIndexer
{
    public const MANY_TO_MANY_ID_FIELD_UPDATER = 'landing_page.many-to-many-id-field';

    private IteratorFactory $iteratorFactory;

    private EntityRepository $repository;

    private ManyToManyIdFieldUpdater $manyToManyIdFieldUpdater;

    private EventDispatcherInterface $eventDispatcher;

    /**
     * @internal
     */
    public function __construct(
        IteratorFactory $iteratorFactory,
        EntityRepository $repository,
        ManyToManyIdFieldUpdater $manyToManyIdFieldUpdater,
        EventDispatcherInterface $eventDispatcher
    ) {
        $this->iteratorFactory = $iteratorFactory;
        $this->repository = $repository;
        $this->manyToManyIdFieldUpdater = $manyToManyIdFieldUpdater;
        $this->eventDispatcher = $eventDispatcher;
    }

    public function getName(): string
    {
        return 'landing_page.indexer';
    }

    /**
     * @param array|null $offset
     *
     * @deprecated tag:v6.5.0 The parameter $offset will be native typed
     */
    public function iterate(/*?array */$offset): ?EntityIndexingMessage
    {
        if ($offset !== null && !\is_array($offset)) {
            Feature::triggerDeprecationOrThrow(
                'v6.5.0.0',
                'Parameter `$offset` of method "iterate()" in class "LandingPageIndexer" will be natively typed to `?array` in v6.5.0.0.'
            );
        }

        $iterator = $this->iteratorFactory->createIterator($this->repository->getDefinition(), $offset);

        $ids = $iterator->fetch();

        if (empty($ids)) {
            return null;
        }

        return new LandingPageIndexingMessage(array_values($ids), $iterator->getOffset());
    }

    public function update(EntityWrittenContainerEvent $event): ?EntityIndexingMessage
    {
        $updates = $event->getPrimaryKeys(LandingPageDefinition::ENTITY_NAME);

        if (empty($updates)) {
            return null;
        }

        return new LandingPageIndexingMessage(array_values($updates), null, $event->getContext());
    }

    public function handle(EntityIndexingMessage $message): void
    {
        $ids = $message->getData();
        $ids = array_unique(array_filter($ids));

        if (empty($ids)) {
            return;
        }

        $context = $message->getContext();

        if ($message->allow(self::MANY_TO_MANY_ID_FIELD_UPDATER)) {
            $this->manyToManyIdFieldUpdater->update(LandingPageDefinition::ENTITY_NAME, $ids, $context);
        }

        $this->eventDispatcher->dispatch(new LandingPageIndexerEvent($ids, $context, $message->getSkip()));
    }

    public function getOptions(): array
    {
        return [
            self::MANY_TO_MANY_ID_FIELD_UPDATER,
        ];
    }

    public function getTotal(): int
    {
        return $this->iteratorFactory->createIterator($this->repository->getDefinition())->fetchCount();
    }

    public function getDecorated(): EntityIndexer
    {
        throw new DecorationPatternException(static::class);
    }
}
