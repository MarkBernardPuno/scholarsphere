import ProfileCard from "../../components/profile-card";

const SideNav = ({children}) => {
    return (
      <div className="p-4" style={{ width: "20%" }}>
        <h1 className="h5 mb-4" style={{ color: "#FBC505" }}>
          ScholarSphere
        </h1>
        <ProfileCard />
        <br />
        {children}
      </div>
    );
  };


export default SideNav;