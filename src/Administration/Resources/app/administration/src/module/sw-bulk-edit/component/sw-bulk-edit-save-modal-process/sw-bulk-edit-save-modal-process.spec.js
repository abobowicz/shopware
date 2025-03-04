import { shallowMount } from '@vue/test-utils';
import swBulkEditSaveModalProcess from 'src/module/sw-bulk-edit/component/sw-bulk-edit-save-modal-process';
import swBulkEditState from 'src/module/sw-bulk-edit/state/sw-bulk-edit.state';

Shopware.Component.register('sw-bulk-edit-save-modal-process', swBulkEditSaveModalProcess);
Shopware.Component.register('sw-bulk-edit-state', swBulkEditSaveModalProcess);

async function createWrapper() {
    return shallowMount(await Shopware.Component.build('sw-bulk-edit-save-modal-process'), {
        stubs: {
            'sw-alert': true,
            'sw-icon': true,
            'sw-label': true,
        },
        provide: {
            orderDocumentApiService: {
                create: () => {
                    return Promise.resolve();
                },
                generate: () => null,
            },
        }
    });
}

describe('sw-bulk-edit-save-modal-process', () => {
    let wrapper;

    beforeEach(() => {
        if (Shopware.State.get('swBulkEdit')) {
            Shopware.State.unregisterModule('swBulkEdit');
        }

        Shopware.State.registerModule('swBulkEdit', swBulkEditState);
    });

    beforeEach(async () => {
        wrapper = await createWrapper();
    });

    afterEach(() => {
        wrapper.destroy();
    });

    it('should be a Vue.js component', async () => {
        expect(wrapper.vm).toBeTruthy();
    });

    it('should create documents when component created', async () => {
        wrapper.vm.createDocuments = jest.fn();

        await wrapper.vm.createdComponent();

        expect(wrapper.vm.createDocuments).toHaveBeenCalled();
        wrapper.vm.createDocuments.mockRestore();
    });

    it('should not be able to create documents', async () => {
        wrapper.vm.createDocument = jest.fn();
        Shopware.State.commit('shopwareApps/setSelectedIds', []);

        await wrapper.vm.createDocuments();

        expect(wrapper.vm.createDocument).not.toHaveBeenCalled();
        wrapper.vm.createDocument.mockRestore();
    });

    it('should be able to create invoice document', async () => {
        wrapper.vm.createDocument = jest.fn();
        Shopware.State.commit('shopwareApps/setSelectedIds', ['orderId']);
        Shopware.State.commit('swBulkEdit/setOrderDocumentsIsChanged', {
            type: 'invoice',
            isChanged: true,
        });

        await wrapper.vm.createDocuments();

        expect(wrapper.vm.createDocument).toHaveBeenCalledWith('invoice', expect.arrayContaining([
            expect.objectContaining({
                config: expect.objectContaining({
                    documentComment: null,
                }),
                fileType: 'pdf',
                orderId: 'orderId',
                type: 'invoice',
            }),
        ]));
        wrapper.vm.createDocument.mockRestore();
    });

    it('should be able to create storno document', async () => {
        wrapper.vm.createDocument = jest.fn();
        Shopware.State.commit('shopwareApps/setSelectedIds', ['orderId']);
        Shopware.State.commit('swBulkEdit/setOrderDocumentsIsChanged', {
            type: 'storno',
            isChanged: true,
        });

        await wrapper.vm.createDocuments();

        expect(wrapper.vm.createDocument).toHaveBeenCalledWith('storno', expect.arrayContaining([
            expect.objectContaining({
                config: expect.objectContaining({
                    documentComment: null,
                }),
                fileType: 'pdf',
                orderId: 'orderId',
                type: 'storno',
            }),
        ]));
        wrapper.vm.createDocument.mockRestore();
    });

    it('should be able to create delivery note document', async () => {
        wrapper.vm.createDocument = jest.fn();
        Shopware.State.commit('shopwareApps/setSelectedIds', ['orderId']);
        Shopware.State.commit('swBulkEdit/setOrderDocumentsIsChanged', {
            type: 'delivery_note',
            isChanged: true,
        });

        await wrapper.vm.createDocuments();

        expect(wrapper.vm.createDocument).toHaveBeenCalledWith('delivery_note', expect.arrayContaining([
            expect.objectContaining({
                config: expect.objectContaining({
                    documentComment: null,
                }),
                fileType: 'pdf',
                orderId: 'orderId',
                type: 'delivery_note',
            }),
        ]));
        wrapper.vm.createDocument.mockRestore();
    });

    it('should be able to create credit note document', async () => {
        wrapper.vm.createDocument = jest.fn();
        Shopware.State.commit('shopwareApps/setSelectedIds', ['orderId']);
        Shopware.State.commit('swBulkEdit/setOrderDocumentsIsChanged', {
            type: 'credit_note',
            isChanged: true,
        });

        await wrapper.vm.createDocuments();

        expect(wrapper.vm.createDocument).toHaveBeenCalledWith('credit_note', expect.arrayContaining([
            expect.objectContaining({
                config: expect.objectContaining({
                    documentComment: null,
                }),
                fileType: 'pdf',
                orderId: 'orderId',
                type: 'credit_note',
            }),
        ]));
        wrapper.vm.createDocument.mockRestore();
    });

    it('should create document successful', async () => {
        wrapper.vm.orderDocumentApiService.generate = jest.fn(() => Promise.resolve());

        await wrapper.vm.createDocument('invoice', [
            {
                config: {
                    documentDate: 'documentDate',
                    documentComment: 'documentComment',
                },
                fileType: 'pdf',
                orderId: 'orderId',
                type: 'invoice',
            },
        ]);

        expect(wrapper.vm.document.invoice.isReached).toBe(100);
        wrapper.vm.orderDocumentApiService.generate.mockRestore();
    });

    it('should break down the request to generate the document', async () => {
        wrapper.vm.orderDocumentApiService.generate = jest.fn(() => Promise.resolve());

        Shopware.State.commit('shopwareApps/setSelectedIds', [
            'orderId',
            'orderId2',
            'orderId3',
            'orderId4',
            'orderId5',
            'orderId6',
        ]);
        Shopware.State.commit('swBulkEdit/setOrderDocumentsIsChanged', {
            type: 'invoice',
            isChanged: true,
        });
        Shopware.State.commit('swBulkEdit/setOrderDocumentsIsChanged', {
            type: 'storno',
            isChanged: false,
        });
        Shopware.State.commit('swBulkEdit/setOrderDocumentsIsChanged', {
            type: 'delivery_note',
            isChanged: false,
        });
        Shopware.State.commit('swBulkEdit/setOrderDocumentsIsChanged', {
            type: 'credit_note',
            isChanged: false,
        });

        await wrapper.vm.createDocuments();

        expect(wrapper.vm.orderDocumentApiService.generate).toHaveBeenCalledTimes(2);
        expect(wrapper.vm.document.invoice.isReached).toBe(100);

        wrapper.vm.orderDocumentApiService.generate.mockRestore();
    });

    it('should compute selectedDocumentTypes correctly', async () => {
        expect(wrapper.vm.selectedDocumentTypes).toEqual([]);

        Shopware.State.commit('swBulkEdit/setOrderDocumentsIsChanged', {
            type: 'invoice',
            isChanged: true,
        });

        Shopware.State.commit('swBulkEdit/setOrderDocumentsIsChanged', {
            type: 'download',
            isChanged: true,
        });

        Shopware.State.commit('swBulkEdit/setOrderDocumentsValue', {
            type: 'invoice',
            value: {
                documentDate: 'documentDate',
                documentComment: 'documentComment',
            },
        });

        Shopware.State.commit('swBulkEdit/setOrderDocumentsValue', {
            type: 'download',
            value: [],
        });

        expect(wrapper.vm.selectedDocumentTypes).toStrictEqual([]);

        Shopware.State.commit('swBulkEdit/setOrderDocumentsValue', {
            type: 'download',
            value: [
                {
                    id: '1',
                    name: 'Invoice',
                    selected: true,
                    technicalName: 'invoice',
                    translated: {
                        name: 'Invoice',
                    },
                },
            ],
        });

        expect(wrapper.vm.selectedDocumentTypes).toStrictEqual([
            {
                id: '1',
                name: 'Invoice',
                selected: true,
                technicalName: 'invoice',
                translated: {
                    name: 'Invoice',
                },
            },
        ]);
    });
});
