import template from './sw-cms-slot.html.twig';
import './sw-cms-slot.scss';

const { deepCopyObject } = Shopware.Utils.object;

/**
 * @private since v6.5.0
 * @package content
 */
export default {
    template,

    inject: ['cmsService'],

    props: {
        element: {
            type: Object,
            required: true,
            default() {
                return {};
            },
        },

        active: {
            type: Boolean,
            required: false,
            default: false,
        },

        disabled: {
            type: Boolean,
            required: false,
            default: false,
        },
    },

    data() {
        return {
            showElementSettings: false,
            showElementSelection: false,
        };
    },

    computed: {
        slotElementId() {
            return this.element.id;
        },

        elementConfig() {
            return this.cmsService.getCmsElementConfigByName(this.element.type);
        },

        cmsElements() {
            const currentPageType = Shopware.State.get('cmsPageState').currentPageType;

            const blocks = Object.entries(this.cmsService.getCmsElementRegistry())
                .filter(([name]) => this.cmsService.isElementAllowedInPageType(name, currentPageType));

            return Object.fromEntries(blocks);
        },

        componentClasses() {
            const componentClass = `sw-cms-slot-${this.element.slot}`;

            return {
                'is--disabled': this.disabled,
                [componentClass]: !!this.element.slot,
            };
        },

        cmsSlotSettingsClasses() {
            if (this.elementConfig.defaultConfig && !this.element.locked) {
                return null;
            }

            return 'is--disabled';
        },

        tooltipDisabled() {
            if (this.elementConfig.disabledConfigInfoTextKey) {
                return {
                    message: this.$tc(this.elementConfig.disabledConfigInfoTextKey),
                    disabled: !!this.elementConfig.defaultConfig && !this.element.locked,
                };
            }

            return {
                message: this.$tc('sw-cms.elements.general.config.tab.settings'),
                disabled: true,
            };
        },
    },

    methods: {
        onSettingsButtonClick() {
            if (!this.elementConfig.defaultConfig || this.element.locked) {
                return;
            }

            this.showElementSettings = true;
        },

        onCloseSettingsModal() {
            this.showElementSettings = false;
        },

        onElementButtonClick() {
            this.showElementSelection = true;
        },

        onCloseElementModal() {
            this.showElementSelection = false;
        },
        onSelectElement(element) {
            this.element.data = deepCopyObject(element?.defaultData || {});
            this.element.config = deepCopyObject(element?.defaultConfig || {});
            this.element.type = element.name;
            this.element.locked = false;
            this.showElementSelection = false;
        },
    },
};
