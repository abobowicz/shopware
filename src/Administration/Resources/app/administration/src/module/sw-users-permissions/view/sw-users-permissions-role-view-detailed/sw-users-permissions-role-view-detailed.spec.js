import { shallowMount, createLocalVue } from '@vue/test-utils';
import swUsersPermissionsRoleViewDetailed from 'src/module/sw-users-permissions/view/sw-users-permissions-role-view-detailed';

Shopware.Component.register('sw-users-permissions-role-view-detailed', swUsersPermissionsRoleViewDetailed);

async function createWrapper(privileges = []) {
    const localVue = createLocalVue();

    return shallowMount(await Shopware.Component.build('sw-users-permissions-role-view-detailed'), {
        localVue,
        stubs: {
            'sw-alert': true,
            'sw-users-permissions-detailed-permissions-grid': true,
            'sw-users-permissions-detailed-additional-permissions': true
        },
        propsData: {
            role: {},
            detailedPrivileges: []
        },
        provide: {
            acl: {
                can: (identifier) => {
                    if (!identifier) { return true; }

                    return privileges.includes(identifier);
                }
            }
        }
    });
}

describe('module/sw-users-permissions/view/sw-users-permissions-role-view-detailed', () => {
    it('should be a Vue.js component', async () => {
        const wrapper = await createWrapper();
        expect(wrapper.vm).toBeTruthy();
    });

    it('should disable the detailed permission grid when no aclPrivileges exists', async () => {
        const wrapper = await createWrapper();

        const detailedPermissionGrid = wrapper.find('sw-users-permissions-detailed-permissions-grid-stub');

        expect(detailedPermissionGrid.attributes().disabled).toBe('true');
    });

    it('should enable the detailed permission grid when edit aclPrivileges exists', async () => {
        const wrapper = await createWrapper(['users_and_permissions.editor']);

        const detailedPermissionGrid = wrapper.find('sw-users-permissions-detailed-permissions-grid-stub');

        expect(detailedPermissionGrid.attributes().disabled).toBeUndefined();
    });

    it('should show an alert which contains the help text', async () => {
        const wrapper = await createWrapper();

        const alert = wrapper.find('sw-alert-stub');
        expect(alert.text()).toBe('sw-users-permissions.roles.view.detailed.alertText');
    });
});
