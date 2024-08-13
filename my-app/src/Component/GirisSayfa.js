import React from 'react';
import '../App.css'

const  GirisSayfa = () => {
  return (
    <div className="max-w-sm mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
      <div className="bg-blue-500 p-4">
        <h2 className="text-white text-2xl font-bold">Tailwind CSS ile Kart Bileşeni</h2>
      </div>
      <div className="p-4">
        <p className="text-gray-700">
          Bu, Tailwind CSS kullanarak oluşturulmuş basit bir kart bileşeni örneğidir. Tailwind CSS'in sağladığı
          sınıflarla hızlıca özelleştirilebilir ve şık bileşenler oluşturabilirsiniz.
        </p>
        <button className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          Daha Fazla Bilgi
        </button>
      </div>
    </div>
  );
};

export default GirisSayfa;
