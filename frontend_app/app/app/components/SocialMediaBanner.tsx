import React from 'react';

const SocialMediaBanner: React.FC = () => {
  return (
    <section className="mb-12">
      <div className="relative overflow-hidden bg-gradient-to-r from-purple-600/10 via-blue-600/10 to-purple-600/10 
                      rounded-2xl border border-purple-500/20 p-6">
        <div className="relative flex items-center justify-between">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3 mb-4">
              <h2 className="text-xl font-bold text-white">Join Our Community</h2>
            </div>

            <p className="text-gray-300 mb-4 leading-relaxed">
              Stay at the forefront of AI innovation! Follow us on X for exclusive updates,
              early access to new features, and be part of our growing community of AI enthusiasts.
            </p>

            <div className="flex items-center gap-4">
              <a href="https://x.com/NexArb_" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 
                        text-white rounded-lg transition-colors duration-200">
                <span>Follow Us</span>
              </a>
              <span className="text-sm text-purple-400/80">Join 5k+ AI enthusiasts</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SocialMediaBanner; 