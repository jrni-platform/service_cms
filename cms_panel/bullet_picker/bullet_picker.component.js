import template from './bullet_picker.html';

import Configurator from 'bookingbug-configurator-js';
import './bullet_picker.scss';
import { bbAuthorisation } from 'bookingbug-core-js';

// add this bullet picker as a new page
Configurator.addPage('Services', 'bullet_picker', { 
    style: 'tab',
    layout: [
        [
          {
            type: 'bb-bullet-picker-panel',
            width: 12,
            index: 0,
            panel_params: {
            }
          }
        ]
    ]
});

// add a bullet picker as a service tab
Configurator.addNamedTab('service_profile', { 
    name: 'Bullets',
    path: '.views({view: "bullet_picker"})',
    position: -1
});


class BulletPickerCtrl {
    constructor($timeout) {
        this.$timeout = $timeout;
        this.company = bbAuthorisation.getCompany();

        // get the current service from the filter that is passed in
        this.service = this.filter.service;
        this.enabledItems = {};
        this.unsavedChanges = false;

        // get the bullets
        this.getBullets();
      
    }

    async getBullets(){
        try {
            this.app = await this.company.$get('apps', {app_name: 'service_cms' });

            // get all bullets
            this.app.$flush('bullets');
            // for all call that returns a collection - we have to currently make two calls to take about the embedded collcation
            this.bullets = (await ( await this.app.$get('bullets')).$get('custom_objects'));
            // keep two maps of the exisiting bullets - one by id, and another by href
            this.bullets_by_id = {};
            this.bullets.map( bullet => this.bullets_by_id[bullet.id] = bullet );
            this.bullets_by_href = {};
            this.bullets.map( bullet => this.bullets_by_href[bullet.$href('self')] = bullet );

            //now get the bullet maps
            // the maps are a simple object that maps services, to bullets, simulating a many-to-many relationhs - since we don't suppor that natively as a type yet
            // flush it and fetch it and unwrap the collection of custom objects
            this.service.$flush('service_cms.bullet_maps');
            const service_bullet_maps = await (await this.service.$get('service_cms.bullet_maps')).$get('custom_objects');
            // create a handy map of bullet maps by the href of bullet they match to
            this.service_bullet_maps_by_bullet = {};

            /// go round the bullet maps we loaded for this service. keep some handy refernces and also set an enabled variable for each one that is enabled
            service_bullet_maps.map( (bullet_map) => {
                if (bullet_map.$href('service_cms.bullet')){
                    this.service_bullet_maps_by_bullet[bullet_map.$href('service_cms.bullet')] = bullet_map;
                    const bullet = this.bullets_by_href[bullet_map.$href('service_cms.bullet')];
                    this.enabledItems[bullet.id] = true;
                }
            });

        } catch (err) {
            console.error(err);
        }
    }

    toggleItem(id) {
        this.enabledItems[id] = !this.enabledItems[id];
        this.unsavedChanges = true;
        this.showSuccessMessage = false;
    }

    /**
     * Check if the name passed in contains the search filter
     * @param {string} name The name of the toggleable item.
     * @returns {boolean} True if the name contains the search filter string.
     */
    matchesFilter(name) {
        return name.toLowerCase().indexOf(this.search.toLowerCase()) !== -1;
    }    


    /**
     * Updates the bullet map entries on the service, either creating or deleteing them as needed
     */
    async save() {
        try {
            const payload = {};


            for (const key in this.enabledItems) {
                const href = this.bullets_by_id[key].$href('self');
                if (this.enabledItems[key]){
                    // get the href of the bullet
                    if (!this.service_bullet_maps_by_bullet[href]) {
                        // if there's no entry for this one already - add one
                        const new_map = await this.service.$post('service_cms.bullet_maps', {}, {"service_cms.bullet_id": key})
                        this.service_bullet_maps_by_bullet[key] = new_map;
                    }
                } else {
                    // check if there IS an entry for this one
                    if (this.service_bullet_maps_by_bullet[href]) {
                        // and if there is - delete it
                        await this.service_bullet_maps_by_bullet[href].$del('self');
                        delete this.service_bullet_maps_by_bullet[href];
                    }

                }
            }
            this.unsavedChanges = false;
            this.showSuccessMessage = true;
            this.$timeout(() => {
                this.showSuccessMessage = false;
            }, 3000);

        } catch (err) {
            console.error(err);
        }
    }

  
}

// set up the angular component
const bulletPickerPanel = {
    templateUrl: template.id,
    controller: BulletPickerCtrl,
    scope: true,
    bindings: {
        filter: '<'
    }
};

angular
    .module('BBAdminDashboard')
    .component('bbBulletPickerPanel', bulletPickerPanel);
