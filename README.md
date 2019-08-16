## Service CMS example

This exmaple JRNI App is pefect for business who wish to store extra details about a Service in the platform.

The App works by creating a new custom object, called a Bullet, that essentailly contains a title and description.

Each Bullet can then be assigned to one or more services, using a mapping object called a Bullet Map. This allows you to create multiple shared extra descriptions about services, that you can then assign a service.

The App expands the Studio UI by adding two new pages:
* A Bullet Editor page that shows you created bullets and lets and edit and delete existing ones
* A Bullet Picker page, which is added to the services tabs that lets you pick the bullets to be assigned to that service.

The properties of the Bullets are then exposed via the Public API's and attached to the services via HAL, that allow you to build a front end pulbic interface that reads these extra service properties

The idea of this app is that JRNI can start to power a more complete CMS of your services, allowing complicated extra data objects to enhance your website.

Feel free to add extra properies to the bullets as you see fit, or to attatch them to other core objects, such as Staff, Resources or Companies to allow you to further extend data sets



