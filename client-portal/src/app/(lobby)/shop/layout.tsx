type ShopLayoutProps = {
  children: React.ReactNode;
};

export default function ShopLayout({ children }: ShopLayoutProps) {
  return (
    <div className="relative flex flex-1 flex-col -mx-4 -mb-8 -mt-4 md:-mx-8 md:-mb-10 md:-mt-6">
      {children}
    </div>
  );
}
