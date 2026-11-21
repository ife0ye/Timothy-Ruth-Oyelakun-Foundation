import { mount } from '../mount';
import Home from '../pages/Home';

// The donate and contact sections used to live on this page. Send old links, and donors
// returning from a checkout started before the move, to where those sections are now.
const { search, hash } = window.location;
if (new URLSearchParams(search).has('tx_ref') || hash === '#donate') {
  window.location.replace(`/donate${search}`);
} else if (hash === '#contact') {
  window.location.replace('/contact');
} else {
  mount(<Home />);
}
