import "../sass/style.scss";

import {
  $,
  $$
} from "./modules/bling";
import autocomplete from "./modules/autocomplete";

autocomplete($("#address"), $("#address_lat"), $("#address_lng"));

import typeAhead from './modules/typeAhead'
typeAhead($('.search'));


import makeMap from "./modules/map"
makeMap($('#map'))

import ajaxHeart from "./modules/heart"
const heartForms = $$('form.heart');
heartForms.on('submit', ajaxHeart);