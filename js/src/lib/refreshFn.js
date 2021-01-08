import { refreshGameInfo } from './gameExecutionLogic.js';

const refreshGamePlay = () => {
  const refreshGameRef = setInterval(() => {
    refreshGameInfo(refreshGameRef);
  }, 1500);
};
export default refreshGamePlay;
