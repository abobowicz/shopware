import template from './sw-settings-search-live-search-keyword.html.twig';
import './sw-settings-search-live-search-keyword.scss';

// eslint-disable-next-line sw-deprecation-rules/private-feature-declarations
export default {
    template,

    props: {
        text: {
            type: String,
            required: true,
            default: null,
        },

        searchTerm: {
            type: String,
            required: true,
            default: null,
        },

        highlightClass: {
            type: String,
            required: false,
            default: 'sw-settings-search-live-search-keyword__highlight',
        },
    },

    computed: {
        parsedSearch() {
            return `(${this.searchTerm.trim().replace(/ +/g, '|')})`;
        },

        parsedMsg() {
            return this.text.split(
                new RegExp(this.parsedSearch, 'gi'),
            );
        },
    },

    methods: {
        getClass(index) {
            return index ? this.highlightClass : {};
        },
    },
};
