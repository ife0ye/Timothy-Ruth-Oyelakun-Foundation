import foundersImage from '@/assets/06992b70ef9c79c032f83d1601903c63f97476f6.png';

export function About() {
  return (
    <section id="about" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="order-2 md:order-1">
            <h2 className="text-4xl font-bold text-[#1a4d5d] mb-6">In Loving Memory</h2>
            <h3 className="text-2xl text-[#8b3a3a] mb-6">Timothy & Ruth Oyelakun</h3>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                The Timothy and Ruth Oyelakun Foundation was established to honor the remarkable lives 
                and enduring legacy of Timothy and Ruth Oyelakun. Throughout their lives, they exemplified 
                compassion, generosity, and a deep commitment to uplifting the less privileged and indigent.
              </p>
              <p>
                Our foundation is dedicated to assisting humanity through comprehensive support in healthcare, 
                education, business empowerment, and community development. We provide aid and grants to those 
                in need, ensuring that less privileged and indigent people have access to essential services and opportunities 
                for advancement.
              </p>
              <p>
                Though they are no longer with us, Timothy and Ruth's spirit lives on through every scholarship 
                awarded, every medical bill paid, every business empowered, and every community infrastructure 
                project completed. This foundation stands as a testament to their belief in the dignity and 
                potential of every human being.
              </p>
            </div>
          </div>
          <div className="order-1 md:order-2">
            <div className="relative">
              <div className="absolute inset-0 bg-[#1a4d5d] rounded-2xl transform translate-x-4 translate-y-4"></div>
              <img 
                src={foundersImage} 
                alt="Timothy and Ruth Oyelakun" 
                className="relative rounded-2xl shadow-xl w-full h-auto object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
