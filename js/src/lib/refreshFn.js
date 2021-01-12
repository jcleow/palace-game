import { refreshGameInfo } from './gameExecutionLogic.js';

const refreshGamePlay = () => {
  const refreshGamePlayRef = setInterval(() => {
    refreshGameInfo(refreshGamePlayRef);
  }, 500);
};

export default refreshGamePlay;
