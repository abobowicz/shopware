import { shallowMount } from '@vue/test-utils';
import swOrderDetail from 'src/module/sw-order/page/sw-order-detail';
import swOrderDetailState from 'src/module/sw-order/state/order-detail.store';

Shopware.Component.register('sw-order-detail', swOrderDetail);

async function createWrapper(privileges = []) {
    return shallowMount(await Shopware.Component.build('sw-order-detail'), {
        mocks: {
            $route: {
                meta: {
                    $module: {
                        routes: {
                            detail: {
                                children: {
                                    base: {},
                                    other: {}
                                }
                            }
                        }
                    }
                }
            }
        },
        stubs: {
            'sw-page': {
                template: `
                    <div>
                        <slot name="smart-bar-header"></slot>
                        <slot name="smart-bar-actions"></slot>
                    </div>`
            },
            'sw-button': true,
            'sw-label': true,
            'sw-skeleton': true,
            'sw-button-process': true,
        },
        propsData: {
            orderId: Shopware.Utils.createId()
        },
        provide: {
            acl: {
                can: (key) => {
                    if (!key) { return true; }

                    return privileges.includes(key);
                }
            },
            repositoryFactory: {
                create: () => ({
                    search: () => Promise.resolve([]),
                    hasChanges: () => Promise.resolve([]),
                    deleteVersion: () => Promise.resolve([]),
                    createVersion: () => Promise.resolve({ versionId: 'newVersionId' }),
                    get: () => Promise.resolve([]),
                })
            },
            orderService: {}
        }
    });
}

describe('src/module/sw-order/page/sw-order-detail', () => {
    let wrapper;

    beforeEach(async () => {
        wrapper = await createWrapper();

        Shopware.State.unregisterModule('swOrderDetail');
        Shopware.State.registerModule('swOrderDetail', swOrderDetailState);
    });

    afterEach(() => {
        wrapper.destroy();
    });

    it('should be a Vue.js component', async () => {
        expect(wrapper.vm).toBeTruthy();
    });

    it('should have an disabled edit button', async () => {
        await wrapper.setData({ isLoading: false });

        const editButton = wrapper.find('.sw-order-detail__smart-bar-edit-button');

        expect(editButton.attributes().disabled).toBe('true');
    });

    it('should have an enabled edit button', async () => {
        wrapper.destroy();
        wrapper = await createWrapper(['order.editor']);

        Shopware.State.unregisterModule('swOrderDetail');
        Shopware.State.registerModule('swOrderDetail', swOrderDetailState);

        await wrapper.setData({ isLoading: false });

        const editButton = wrapper.find('.sw-order-detail__smart-bar-edit-button');

        expect(editButton.attributes().disabled).toBeUndefined();
    });

    it('should not contain manual label', async () => {
        expect(wrapper.find('.sw-order-detail__manual-order-label').exists()).toBeFalsy();
    });

    it('should contain manual label', async () => {
        await wrapper.setData({ identifier: '1', createdById: '2' });

        expect(wrapper.find('.sw-order-detail__manual-order-label').exists()).toBeTruthy();
    });

    it('should created a new version when component was created', async () => {
        global.activeFeatureFlags = ['FEATURE_NEXT_7530'];
        const createNewVersionIdSpy = jest.spyOn(wrapper.vm, 'createNewVersionId');

        await wrapper.vm.createdComponent();

        expect(createNewVersionIdSpy).toHaveBeenCalledTimes(1);
        expect(wrapper.vm.hasNewVersionId).toBeTruthy();
    });

    it('should clean up unsaved version when component gets destroyed', async () => {
        global.activeFeatureFlags = ['FEATURE_NEXT_7530'];
        await wrapper.vm.createNewVersionId();
        wrapper.vm.orderRepository.deleteVersion = jest.fn(() => Promise.resolve());

        await wrapper.vm.beforeDestroyComponent();

        expect(wrapper.vm.orderRepository.deleteVersion).toHaveBeenCalledTimes(1);
    });
});
