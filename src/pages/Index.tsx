import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <h1 className="mb-4 text-4xl font-bold">Welcome to Your Blank App</h1>
        <p className="text-xl text-muted-foreground">Apresentações disponíveis:</p>
        <div className="flex flex-col gap-3 pt-4">
          <Link to="/maxwell-stokes" className="inline-block rounded-lg bg-primary px-6 py-3 font-semibold text-primary-foreground hover:opacity-90">
            ⚡ Maxwell &amp; Stokes (IFTO) →
          </Link>
          <Link to="/gerador-eolico" className="inline-block rounded-lg bg-emerald-500 px-6 py-3 font-semibold text-white hover:opacity-90">
            🌬️ Gerador Eólico (IFG) →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Index;
