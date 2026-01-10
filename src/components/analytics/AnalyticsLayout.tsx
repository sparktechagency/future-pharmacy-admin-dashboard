"use client";

import AreaChart from "./AreaChart";
import DashboardStats from './DashboardStats';
import DeliveriesDonutChart from './DeliveriesDonutChart';
import RxDeliveryTable from './RxDeliveryTable';


function AnalyticsLayout() {
  return (
    <div className="space-y-4 min-w-0">
      <DashboardStats />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
        <div className="h-[450px] min-w-0 ">
          <DeliveriesDonutChart />
        </div>
        <div className="h-[450px] min-w-0">
          <AreaChart />
        </div>
      </div>

      <div className="">
        <RxDeliveryTable />
      </div>
    </div>
  );
}

export default AnalyticsLayout;
