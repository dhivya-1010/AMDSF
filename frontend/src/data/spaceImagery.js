/**
 * AMDSF Centralized Space Imagery Registry
 * High-resolution, realistic scientific space mission photography assets.
 * Sources: NASA, ESA, scientific spacecraft observations.
 */

import earthHeroImg from '../assets/images/earth_orbit_hero.jpg';
import rocketLaunchImg from '../assets/images/rocket_launch_pad.jpg';
import debrisBgImg from '../assets/images/debris_orbital_shell.jpg';
import solarBgImg from '../assets/images/solar_dynamics_sun.jpg';
import propulsionBgImg from '../assets/images/propulsion_staging.jpg';
import coverageFootprintImg from '../assets/images/coverage_footprint.jpg';
import satelliteOrbitImg from '../assets/images/satellite_orbit.jpg';
import earthHorizonImg from '../assets/images/earth_horizon.jpg';

export const SPACE_SCENES = {
  earth: {
    id: 'earth',
    name: 'Earth from Orbit',
    image: earthHeroImg,
    alt: 'Earth curvature and atmospheric glow viewed from low Earth orbit',
    attribution: 'NASA Earth Observatory / scientific low Earth orbit imaging',
    description: 'High-resolution view of Earth with atmospheric limb and starry deep space.',
  },
  rocket: {
    id: 'rocket',
    name: 'Rocket Launch & Ascent',
    image: rocketLaunchImg,
    alt: 'Heavy-lift space vehicle liftoff from launch pad with exhaust plume',
    attribution: 'Aerospace launch facility photography',
    description: 'Orbital class propulsion system ascending through the atmosphere.',
  },
  orbit: {
    id: 'orbit',
    name: 'Satellite in Orbit',
    image: satelliteOrbitImg,
    alt: 'Scientific satellite in low Earth orbit with solar arrays deployed',
    attribution: 'ESA / NASA spacecraft orbit photography',
    description: 'Spacecraft navigating orbital track with Earth surface below.',
  },
  debris: {
    id: 'debris',
    name: 'Orbital Debris Shell',
    image: debrisBgImg,
    alt: 'Earth orbital shell with tracked orbital conjunction pathways',
    attribution: 'Space Situational Awareness tracking visualization',
    description: 'Low Earth Orbit orbital debris environment and cataloged objects.',
  },
  sun: {
    id: 'sun',
    name: 'Solar Dynamics & Corona',
    image: solarBgImg,
    alt: 'Extreme ultraviolet image of solar coronal loops and prominence flares',
    attribution: 'NASA Solar Dynamics Observatory (SDO)',
    description: 'Heliophysics solar wind and geomagnetic radiation environment.',
  },
  propulsion: {
    id: 'propulsion',
    name: 'Propulsion Staging',
    image: propulsionBgImg,
    alt: 'Orbital upper stage propulsion ignition against the black of space',
    attribution: 'Orbital propulsion engineering photography',
    description: 'Delta-V velocity insertion and trajectory optimization.',
  },
  coverage: {
    id: 'coverage',
    name: 'Satellite Communication & Footprint',
    image: coverageFootprintImg,
    alt: 'Earth observation satellite communication beam targeting surface region',
    attribution: 'Earth observation satellite downlink visualization',
    description: 'Ground track revisit footprint and population coverage geometry.',
  },
  horizon: {
    id: 'horizon',
    name: 'Deep Space & Earth Horizon',
    image: earthHorizonImg,
    alt: 'Earth horizon and deep cosmos view from orbital vantage point',
    attribution: 'NASA ISS orbital observation platform',
    description: 'Earth horizon meeting deep cosmos for mission decision synthesis.',
  },
};

export default SPACE_SCENES;
