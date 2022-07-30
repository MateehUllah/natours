/* eslint-disable */
export const displayMap = (locate) => {
  mapboxgl.accessToken =
    'pk.eyJ1IjoibWF0ZWVoMTAiLCJhIjoiY2w2MHQxcWQ3MDNuNjNibzJvcGo2c21kYSJ9.BiXm74ALYq927b3wlGziug';
  var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mateeh10/cl60y3ngf001316pfnt4n6jkv',
    scrollZoom: false,
  });

  const bounds = new mapboxgl.LngLatBounds();
  locate.forEach((loc) => {
    //create markee
    const el = document.createElement('div');
    el.className = 'marker';

    //add marker
    new mapboxgl.Marker({
      element: el,
      anchor: 'bottom',
    })
      .setLngLat(loc.coordinates)
      .addTo(map);

    //add popup
    new mapboxgl.Popup({ offset: 30 })
      .setLngLat(loc.coordinates)
      .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
      .addTo(map);
    //extends map bound to include current loction
    bounds.extend(loc.coordinates);
  });

  map.fitBounds(bounds, {
    padding: {
      top: 200,
      bottom: 150,
      left: 100,
      right: 100,
    },
  });
};
