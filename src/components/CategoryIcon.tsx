import React from 'react';
import {
  Coins,
  Users,
  ShieldCheck,
  Landmark,
  PiggyBank,
  GraduationCap,
  BookOpen,
  Zap,
  Building2,
  Wifi,
  Fuel,
  UtensilsCrossed,
  HeartHandshake,
  Scissors,
  Car,
  Dumbbell,
  Wrench,
  Stethoscope,
  CalendarRange,
  Tag,
} from 'lucide-react';

interface CategoryIconProps {
  name: string;
  className?: string;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({ name, className = 'w-4 h-4' }) => {
  switch (name) {
    case 'Coins':
      return <Coins className={className} />;
    case 'Users':
      return <Users className={className} />;
    case 'ShieldCheck':
      return <ShieldCheck className={className} />;
    case 'Landmark':
      return <Landmark className={className} />;
    case 'PiggyBank':
      return <PiggyBank className={className} />;
    case 'GraduationCap':
      return <GraduationCap className={className} />;
    case 'BookOpen':
      return <BookOpen className={className} />;
    case 'Zap':
      return <Zap className={className} />;
    case 'Building2':
      return <Building2 className={className} />;
    case 'Wifi':
      return <Wifi className={className} />;
    case 'Fuel':
      return <Fuel className={className} />;
    case 'UtensilsCrossed':
      return <UtensilsCrossed className={className} />;
    case 'HeartHandshake':
      return <HeartHandshake className={className} />;
    case 'Scissors':
      return <Scissors className={className} />;
    case 'Car':
      return <Car className={className} />;
    case 'Dumbbell':
      return <Dumbbell className={className} />;
    case 'Wrench':
      return <Wrench className={className} />;
    case 'Stethoscope':
      return <Stethoscope className={className} />;
    case 'CalendarRange':
      return <CalendarRange className={className} />;
    default:
      return <Tag className={className} />;
  }
};
