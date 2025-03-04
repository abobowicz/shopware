import './sw-order-state-select.scss';
import template from './sw-order-state-select.html.twig';

/**
 * @feature-deprecated (flag:FEATURE_NEXT_7530) will be dropped
 */
// eslint-disable-next-line sw-deprecation-rules/private-feature-declarations
export default {
    template,
    props: {
        transitionOptions: {
            type: Array,
            required: true,
            default() {
                return [];
            },
        },
        roundedStyle: {
            type: Boolean,
            required: false,
            default: false,
        },
        placeholder: {
            type: String,
            required: false,
            default: null,
        },
        backgroundStyle: {
            type: String,
            required: false,
            default: '',
        },
        disabled: {
            type: Boolean,
            required: false,
            default: false,
        },
    },
    data() {
        return {
            selectedActionName: null,
        };
    },
    computed: {
        selectStyle() {
            return `sw-order-state-select__field${this.roundedStyle ? '--rounded' : ''}`;
        },

        selectPlaceholder() {
            if (this.placeholder) {
                return this.placeholder;
            }
            return this.$tc('sw-order.stateCard.labelSelectStatePlaceholder');
        },
    },
    watch: {
        selectedActionName() {
            if (this.selectedActionName !== null) {
                this.onStateChangeClicked();
            }
        },
    },

    methods: {
        onStateChangeClicked() {
            this.$emit('state-select', this.selectedActionName);
        },
    },
};
