import template from './sw-extension-my-extensions-listing-controls.html.twig';
import './sw-extension-my-extensions-listing-controls.scss';

/**
 * @package merchant-services
 * @deprecated tag:v6.5.0 - Will be private
 */
// eslint-disable-next-line sw-deprecation-rules/private-feature-declarations
export default {
    template,

    data() {
        return {
            filterByActiveState: false,
            selectedSortingOption: 'updated-at',
            sortingOptions: [
                {
                    value: 'updated-at',
                    name: this.$tc('sw-extension.my-extensions.listing.controls.filterOptions.last-updated'),
                },
                {
                    value: 'name-asc',
                    name: this.$tc('sw-extension.my-extensions.listing.controls.filterOptions.name-asc'),
                },
                {
                    value: 'name-desc',
                    name: this.$tc('sw-extension.my-extensions.listing.controls.filterOptions.name-desc'),
                },
            ],
        };
    },

    watch: {
        filterByActiveState(value) {
            this.$emit('update:active-state', value);
        },

        selectedSortingOption(value) {
            this.$emit('update:sorting-option', value);
        },
    },
};
