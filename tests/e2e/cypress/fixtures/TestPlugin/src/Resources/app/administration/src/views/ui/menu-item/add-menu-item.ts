import Vue from 'vue';
import { notification, context, data } from '@shopware-ag/admin-extension-sdk';

const { repository, Classes: { Criteria } } = data;

export default Vue.extend({
    template: `
        <div>
          <h1>Hello from the new Menu Page</h1>
        </div>
    `,
    methods: {}
})
