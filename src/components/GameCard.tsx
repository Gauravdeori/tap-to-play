import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

interface GameCardProps {
  title: string;
  description: string;
  icon: string;
  path: string;
  gradient: string;
  index: number;
}

const GameCard = ({ title, description, icon, path, gradient, index }: GameCardProps) => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.4 }}
      onClick={() => navigate(path)}
      className="game-card group"
    >
      <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl mb-4 ${gradient}`}>
        {icon}
      </div>
      <h3 className="font-display font-bold text-lg text-foreground mb-1 group-hover:text-gradient-primary transition-colors">
        {title}
      </h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
    </motion.div>
  );
};

export default GameCard;
