import React from 'react';
import Image from 'next/image';

interface WelcomeProps {
  gradientTextStyle: React.CSSProperties;
}

const Welcome: React.FC<WelcomeProps> = ({ gradientTextStyle }) => {
  return (
    <div className="flex flex-col items-center justify-center">
      <Image src="/logo.png" alt="Madgic Logo" width={320} height={180} className="w-80 h-45" />

      <div className="bg-white rounded-lg shadow-sm p-6 text-center">
        <h2 className="text-xl font-semibold mb-2" style={gradientTextStyle}>Madgic chat</h2>
        <p className="text-gray-600">
          ✨ In realms of thought, where questions reside,<br/>
          A magical process, I&apos;ll be your guide.<br/>
          First, the grand task, to fragments we break,<br/>
          Each a small quest, for knowledge&apos;s sake.<br/>
          Then spells are cast, and actions take flight,<br/>
          Gathering answers, with all of my might.<br/>
          Finally, threads of insight I weave,<br/>
          A clear, final answer, for you to believe. 🌙
        </p>
      </div>
    </div>
  );
};

export default Welcome; 