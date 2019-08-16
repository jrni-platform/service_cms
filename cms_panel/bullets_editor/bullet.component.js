import template from './bullet.html';
import './bullet.scss';

import Configurator from 'bookingbug-configurator-js';
import { bbAuthorisation } from 'bookingbug-core-js';


// aa new menu item in the customize section of the studio app
Configurator.addMenuItem( {
    group: 'customise',
    key: 'bullet',
    roles: ['owner', 'admin', 'parent'],
    label: 'Custom Blobs',
    sref: 'app.page.views',
    params: {
        view: 'bullet'
    }

});

// add the new page definition
Configurator.addPage('CustomPages', 'bullet', { 
    style: 'tab',
    layout: [
        [
          {
            type: 'bb-bullet-panel',
            width: 12,
            index: 0,
            panel_params: {
            }
          }
        ]
    ]
});



// create an angular controller 
class BulletCtrl {

    constructor() {
      this.onCancel = this.onCancel.bind(this);
      this.onSuccess = this.onSuccess.bind(this);

      this.getAppData();
      
    }

    // load up the existing bullet objects
    async getAppData(){
        try {
            // get teh company we are logged in as
            this.company = bbAuthorisation.getCompany();
            // get the app definition
            this.app = await this.company.$get('apps', {app_name:'service_cms' });
            // go load the existing objects
            this.loadObjects();

            // load the schema definition of the app to create the table
            // we could hard code it in the HTML - but this way new fields are added automatically
            const new_obj = await this.app.$get('new_bullet');
            this.schema = new_obj.schema;
            this.form = new_obj.form;

        } catch (err) {
            console.error(err);
        }
    }


    async loadObjects() {
        try {
            // make sure they're not locally cached
            this.app.$flush('bullets');
            // reload the objects from the API
            const result = await this.app.$get('bullets');
            // unwrap the objects from the HAL response
            this.objects = await result.$get('custom_objects');
        } catch (err) {
            console.error(err);
        }
    }

    createNew() {
        this.object = {};
    }

    onCancel() {
        this.object = null;
    }

    onSuccess(res) {
        this.object = null;
        this.load_objects();
    }

    edit(obj){
          this.object = obj;
    }

    delete(obj) {
        obj.$del('self').then( (res) => {
          this.load_objects();
        });
    }

  
}

// create an angular component that is loaded as the page
const bulletPanel = {
    templateUrl: template.id,
    controller: BulletCtrl,
    scope: true,
    bindings: {
        filter: '<'
    }
};

angular
    .module('BBAdminDashboard')
    .component('bbBulletPanel', bulletPanel);
