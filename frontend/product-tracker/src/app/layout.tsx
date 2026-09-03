import FlowbiteInitializer from "../components/Flowbite/FlowbiteInitializer";
import "../styles/globals.css";

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body className="min-h-full flex flex-col">
        {children}
      </body>
      <FlowbiteInitializer/>
    </html>
  );
}
