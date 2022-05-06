// / <reference types="Cypress" />

import ProductPageObject from '../../../../support/pages/module/sw-product.page-object';

describe('Category: SDK Test', ()=> {
    beforeEach(() => {
        cy.loginViaApi()
            .then(() => {
                return cy.createProductFixture();
            })
            .then(() => {
                cy.openInitialPage(`${Cypress.env('admin')}#/sw/product/index`);

                cy.onlyOnFeature('FEATURE_NEXT_17950');

                cy.getSDKiFrame('sw-main-hidden')
                    .should('exist');
            });
    });
    it('@sdk: modals', ()=> {
        cy.onlyOnFeature('FEATURE_NEXT_17950');

        const Page = new ProductPageObject();

        cy.intercept({
            url: `**/${Cypress.env('apiPath')}/search/property-group`,
            method: 'POST'
        }).as('saveData');
        cy.intercept({
            url: `${Cypress.env('apiPath')}/_action/calculate-price`,
            method: 'POST'
        }).as('calculatePrice');

        cy.contains('.smart-bar__content', 'Products')
        cy.get('.sw-skeleton').should('not.exist');
        cy.get('.sw-loader').should('not.exist');

        cy.clickContextMenuItem(
            '.sw-entity-listing__context-menu-edit-action',
            Page.elements.contextMenuButton,
            `${Page.elements.dataGridRow}--0`
        );

        cy.get('.sw-product-detail__tab-general')
            .should('exist');
        cy.get('.sw-loader')
            .should('not.exist');
        cy.get('.sw-skeleton')
            .should('not.exist');

        cy.get(`a[href*="ui-tabs-product-example-tab"`)
            .click();
        cy.get('.sw-card').contains('Hello in the new tab ');

        cy.getSDKiFrame('ui-modals')
            .contains('Hello in the example card');

        cy.log('Open modal which has normal state');

        cy.getSDKiFrame('ui-modals')
            .contains('Open Modal')
            .click();

        cy.get('.sw-modal')
            .should('be.visible')
            .contains('Hello from the plugin');
        cy.getSDKiFrame('ui-modals-modal-content')
            .should('be.visible')
        cy.getSDKiFrame('ui-modals-modal-content')
            .contains('Hello from the plugin ');
        cy.getSDKiFrame('ui-modals-modal-content')
            .should('be.visible')
        cy.getSDKiFrame('ui-modals-modal-content')
            .contains('Close modal')
            .click();

        cy.getSDKiFrame('ui-modals')
            .contains('Open Modal')
            .click();
        cy.get('.sw-modal__dialog > .sw-modal__footer > .sw-button').last()
            .contains('Close modal')
            .click();

        cy.log('Open modal which has no header');
        cy.getSDKiFrame('ui-modals')
            .contains('Open No Header')
            .click();
        cy.get('.sw-modal__header')
            .should('not.exist');
        cy.getSDKiFrame('ui-modals-modal-content')
            .should('be.visible')
        cy.getSDKiFrame('ui-modals-modal-content')
            .contains('Hello from the plugin ');
        cy.get('.sw-modal__dialog > .sw-modal__footer > .sw-button').last()
            .contains('Close modal')
            .click();

        cy.log('Open modal which is smaller');
        cy.getSDKiFrame('ui-modals')
            .contains('Open small variant')
            .click();
        cy.get('.sw-modal--small')
            .should('exist');
        cy.getSDKiFrame('ui-modals-modal-content')
            .should('be.visible')
        cy.getSDKiFrame('ui-modals-modal-content')
            .contains('Hello from the plugin ');
        cy.get('.sw-modal__dialog > .sw-modal__footer > .sw-button').last()
            .contains('Close modal')
            .click();

        cy.log('Open modal which is not closable without action');
        cy.getSDKiFrame('ui-modals')
            .contains('Open none closable')
            .click();
        cy.getSDKiFrame('ui-modals-modal-content')
            .should('be.visible')
        cy.getSDKiFrame('ui-modals-modal-content')
            .contains('Hello from the plugin ');
        cy.get('.sw-modal__close')
            .should('not.exist');
        cy.get('.sw-modal__dialog > .sw-modal__footer > .sw-button').last()
            .contains('Close modal')
            .click();
    })
})
