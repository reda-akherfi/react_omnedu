import React from "react";

type CardProps = {
  title: string;
  description: string;
};

const Card: React.FC<CardProps> = ({ title, description }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 hover:shadow-lg transition-shadow duration-300">
      <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">{title}</h2>
      <p className="text-gray-600 dark:text-gray-300">{description}</p>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">My First React App</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="Learn React" description="Understand components, state, and props." />
        <Card title="Learn TypeScript" description="Add type safety and interfaces to your code." />
        <Card title="Learn Tailwind" description="Style your app with utility-first CSS." />
      </div>
    </div>
  );
};

export default App;
