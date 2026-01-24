import { Heart, Target, Eye } from 'lucide-react';

export function Mission() {
  return (
    <section id="mission" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-[#1a4d5d] mb-4">Our Mission & Vision</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Continuing Timothy and Ruth's legacy through meaningful action and lasting impact
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-16 h-16 bg-[#8b3a3a] rounded-full flex items-center justify-center mb-6">
              <Heart size={32} className="text-white" />
            </div>
            <h3 className="text-2xl font-bold text-[#1a4d5d] mb-4">Our Mission</h3>
            <p className="text-gray-700 leading-relaxed">
              To assist humanity and indigent people through health-related support, business empowerment grants, 
              educational advancement, scientific research, and community infrastructural development.
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-16 h-16 bg-[#1a4d5d] rounded-full flex items-center justify-center mb-6">
              <Eye size={32} className="text-white" />
            </div>
            <h3 className="text-2xl font-bold text-[#1a4d5d] mb-4">Our Vision</h3>
            <p className="text-gray-700 leading-relaxed">
              A world where less privileged and indigent people have access to quality healthcare, education, 
              business opportunities, and essential community infrastructure to transform their lives 
              and build sustainable futures.
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-16 h-16 bg-[#8b3a3a] rounded-full flex items-center justify-center mb-6">
              <Target size={32} className="text-white" />
            </div>
            <h3 className="text-2xl font-bold text-[#1a4d5d] mb-4">Our Values</h3>
            <p className="text-gray-700 leading-relaxed">
              Compassion, integrity, and service guide everything we do. We believe in treating 
              every individual with dignity and respect while working tirelessly to create 
              lasting, positive change.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}