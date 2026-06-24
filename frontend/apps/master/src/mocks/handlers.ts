import { getHealthMock } from '@/generated/api/health/health.msw';
import { getUsersMock } from '@/generated/api/users/users.msw';

// API モックは全層で MSW に統一し、orval が生成した handlers を共用する（設計 §3.6）。
// モック定義を二重に持たない。リアルなデータが要る所は別層で決定論 fixture を override する。
export const handlers = [...getHealthMock(), ...getUsersMock()];
