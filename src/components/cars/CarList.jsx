import CarCard from './CarCard';

const CarList = ({ cars, onSelect }) => {
  if (!cars.length) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No cars found matching your criteria.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {cars.map(car => (
        <CarCard key={car._id} car={car} onSelect={onSelect} />
      ))}
    </div>
  );
};
export default CarList;