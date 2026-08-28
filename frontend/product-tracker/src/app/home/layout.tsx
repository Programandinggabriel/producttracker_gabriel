import SideBar from "@/src/components/SideBar";

export default function HomeLayout({ children }: LayoutProps<"/home">){
    return(
        <>
            <SideBar/>
            {children}
        </>
    );
}