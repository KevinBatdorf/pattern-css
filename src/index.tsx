import { registerPlugin } from '@wordpress/plugins';
import { PluginDocumentSettingPanelDemo } from './components/PageControl';
import './editor.css';
import { codeIcon } from './icons';

// Do the same for templates ?
// Do it per block too ?
// Can I do it per pattern or anytihng like that ?
// TODO: Add browser list feature

registerPlugin('plugin-sidebar-test', {
    render: PluginDocumentSettingPanelDemo,
    icon: () => codeIcon,
});
