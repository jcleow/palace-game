import axios from 'axios';
import { refreshGameInfo } from './gameExecutionLogic.js';

const refreshGamePlay = () => {
  const refreshGamePlayRef = setInterval(() => {
    refreshGameInfo(refreshGamePlayRef);
  }, 1500);
};

export default refreshGamePlay;
