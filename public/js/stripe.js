import axios from 'axios';
import { showAlert } from './alert';
const stripe = Stripe(
  'pk_test_51LR1uILUBfZNGw78keWDKneOwwU6wf9AsB5rlkdy9Wt7bHKFMcTa4CHgCwcRLFl8rXhJzuQGtZ2ixEsoheR2BQch00tRO13d3h'
);

export const bookTour = async (tourId) => {
  //1)Get the session from the endpoint
  try {
    const session = await axios(`/api/v1/bookings/checkout-session/${tourId}`);
    //console.log(session);
    //2) Create checkout form + charge credit card
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
  } catch (err) {
    showAlert('error', err);
  }
};
