import { refreshGameInfo } from './gameExecutionLogic.js';

const refreshGamePlay = () => {
  const refreshGamePlayRef = setInterval(() => {
    refreshGameInfo(refreshGamePlayRef);
  }, 3000);
};

export default refreshGamePlay;
