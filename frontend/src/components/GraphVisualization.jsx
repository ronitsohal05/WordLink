import React from "react";
import { motion } from "framer-motion";

const GraphVisualization = ({ nodes, edges }) => {
  return (
    <div className="flex justify-center items-center h-full">
      <div className="relative">
        {nodes.map((node, idx) => (
          <motion.div
            key={node.word}
            className="absolute bg-blue-500 text-white p-4 rounded-full"
            style={{
              left: `${50 + 40 * Math.cos((2 * Math.PI * idx) / nodes.length)}%`,
              top: `${50 + 40 * Math.sin((2 * Math.PI * idx) / nodes.length)}%`,
            }}
          >
            {node.word}
          </motion.div>
        ))}
        {edges.map(([from, to], idx) => (
          <motion.div
            key={idx}
            className="absolute bg-red-500 h-1 w-1"
            animate={{ opacity: 1 }}
          >
            {/* Connect the nodes */}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default GraphVisualization;
