import UserTable from "@/components/users/Users";
// import StatCard from '../../../components/common/StatCard';

export default function UsersPage() {
  // const stats = [
  //   {
  //     icon: "/icons/overview/incoming.png",
  //     value: 35,
  //     label: "Total User Requests",
  //     bgColor: "bg-[#C6F2F7]",
  //     iconBgColor: "bg-white",
  //     iconColor: "text-[#3ED1E4]",
  //     textColor: "text-[#3ED1E4]",
  //   },
  //   {
  //     icon: "/icons/overview/driver.png",
  //     value: 15,
  //     label: "Total Users Requests Active",
  //     bgColor: "bg-[#D6F2E4]",
  //     iconBgColor: "bg-white",
  //     iconColor: "text-[#0CAF60]",
  //     textColor: "text-[#0CAF60]",
  //   },
  //   {
  //     icon: "/icons/overview/active-users.png",
  //     value: 152,
  //     label: "Total Users Unactive",
  //     bgColor: "bg-[#FFF0D9]",
  //     iconBgColor: "bg-white",
  //     iconColor: "text-[#FDBD3D]",
  //     textColor: "text-[#FDBD3D]",
  //   },
  // ];
  return (
    <div className='flex flex-col gap-5'>
      {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div> */}
      <UserTable />
    </div>
  );
}
