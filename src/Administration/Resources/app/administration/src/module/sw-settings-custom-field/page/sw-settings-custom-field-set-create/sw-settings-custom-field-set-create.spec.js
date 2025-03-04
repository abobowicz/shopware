import { shallowMount } from '@vue/test-utils';
import swSettingsCustomFieldSetDetail from 'src/module/sw-settings-custom-field/page/sw-settings-custom-field-set-detail';
import swSettingsCustomFieldSetCreate from 'src/module/sw-settings-custom-field/page/sw-settings-custom-field-set-create';
import 'src/app/mixin/notification.mixin';

Shopware.Component.register('sw-settings-custom-field-set-detail', swSettingsCustomFieldSetDetail);
Shopware.Component.extend('sw-settings-custom-field-set-create', 'sw-settings-custom-field-set-detail', swSettingsCustomFieldSetCreate);

async function createWrapper() {
    return shallowMount(await Shopware.Component.build('sw-settings-custom-field-set-create'), {
        mocks: {
            $tc() {
                return 'translation';
            },
        },
        provide: {
            repositoryFactory: {
                create(repositoryName) {
                    if (repositoryName === 'custom_field') {
                        return {};
                    }

                    return {
                        get() {
                            return Promise.resolve({});
                        },
                        create() {
                            return Promise.resolve({});
                        },
                        search() {
                            return Promise.resolve({
                                length: 0,
                            });
                        }
                    };
                }
            },
        },
        stubs: {
            'sw-page': true,
            'sw-empty-state': true,
            'sw-custom-field-set-detail-base': true,
            'sw-button': true,
            'sw-button-process': true,
            'sw-card': true,
            'sw-card-view': true,
            'sw-skeleton': true,
        }
    });
}

describe('src/module/sw-settings-custom-field/page/sw-settings-custom-field-set-create', () => {
    let wrapper;

    beforeEach(async () => {
        wrapper = await createWrapper();
    });

    it('should be a Vue.js component', async () => {
        expect(wrapper.vm).toBeTruthy();
    });

    it('should handle route enter', async () => {
        const next = jest.fn();
        const params = {};
        wrapper.vm.$options.beforeRouteEnter(
            {
                name: 'sw.settings.custom.field.create',
                params,
            },
            {},
            next,
        );

        expect(next).toBeCalledTimes(1);
        expect(params.hasOwnProperty('id')).toBeTruthy();
    });

    it('should finish save', async () => {
        wrapper.vm.$router.push = jest.fn();
        wrapper.vm.saveFinish();

        expect(wrapper.vm.$router.push).toBeCalledTimes(1);
        expect(wrapper.vm.$router.push).toBeCalledWith({
            name: 'sw.settings.custom.field.detail',
            params: {
                id: wrapper.vm.setId,
            }
        });
    });

    it('should create technical name error for empty set', async () => {
        wrapper.vm.set.name = '';
        wrapper.vm.onSave();

        expect(wrapper.vm.technicalNameError).toBeTruthy();
        expect(wrapper.vm.isLoading).toBeFalsy();
        expect(wrapper.vm.technicalNameError.hasOwnProperty('detail')).toBeTruthy();
        expect(wrapper.vm.technicalNameError.detail).toBe('translation');
    });

    it('should create name not unique notification', async () => {
        wrapper.vm.createNotificationError = jest.fn();
        wrapper.vm.createNameNotUniqueNotification();

        expect(wrapper.vm.createNotificationError).toBeCalledTimes(1);
        expect(wrapper.vm.createNotificationError).toBeCalledWith({
            title: 'translation',
            message: 'translation',
        });
        expect(wrapper.vm.technicalNameError).toBeTruthy();
        expect(wrapper.vm.technicalNameError.hasOwnProperty('detail')).toBeTruthy();
        expect(wrapper.vm.technicalNameError.detail).toBe('translation');
    });

    it('should save', async () => {
        wrapper.vm.$super = jest.fn();
        wrapper.vm.onSave();
        await flushPromises();

        expect(wrapper.vm.$super).toBeCalledTimes(1);
        expect(wrapper.vm.$super).toBeCalledWith('onSave');
    });
});
