import { GraduationCap, Users, HeartHandshake, Briefcase, Building2 } from 'lucide-react';

export function Programs() {
  const programs = [
    {
      icon: GraduationCap,
      title: 'Educational Advancement',
      description: 'Promoting education through scholarships, learning materials, and support programs to help individuals achieve their academic goals.',
      color: 'bg-blue-500'
    },
    {
      icon: HeartHandshake,
      title: 'Healthcare Maintenance',
      description: 'Supporting less privileged and indigent people with healthcare services, medical treatment assistance, and health-related financial support.',
      color: 'bg-red-500'
    },
    {
      icon: Briefcase,
      title: 'Business Empowerment',
      description: 'Assisting the needy with business capital provision, entrepreneurship training, and basic skills acquisition for sustainable livelihoods.',
      color: 'bg-green-500'
    },
    {
      icon: Building2,
      title: 'Community Development',
      description: 'Promoting communal development through provision of basic infrastructure and essential developmental needs and services.',
      color: 'bg-purple-500'
    },
    {
      icon: Users,
      title: 'General Aid & Charity',
      description: 'Providing general aid and charity services to less privileged and indigent people, ensuring no one is left behind in their time of need.',
      color: 'bg-orange-500'
    }
  ];

  return (
    <section id="programs" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-[#1a4d5d] mb-4">Our Programs</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Making a difference through targeted initiatives that address critical community needs
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {programs.map((program, index) => (
            <div 
              key={index}
              className="bg-white border-2 border-gray-100 p-6 rounded-xl hover:shadow-xl hover:border-[#1a4d5d] transition-all group"
            >
              <div className={`w-14 h-14 ${program.color} rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                <program.icon size={28} className="text-white" />
              </div>
              <h3 className="text-xl font-bold text-[#1a4d5d] mb-3">{program.title}</h3>
              <p className="text-gray-600 leading-relaxed">{program.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}