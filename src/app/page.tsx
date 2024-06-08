import WebGLScrollContext from "@/components/WebGLScroll/WebGLScrollContext";

export default function Home() {
  return (
    <main className="">
      <WebGLScrollContext>
        <ScrollItem />
        <ScrollItem />
        <ScrollItem />
        <ScrollItem />
        <ScrollItem />
        <ScrollItem />
        <ScrollItem />
        <ScrollItem />
      </WebGLScrollContext>
    </main>
  );
}

const ScrollItem = () => {
  return <div className="h-24">test</div>;
};
