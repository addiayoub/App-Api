


const StatsContent = ({ stats }) => (
  <div>
    <h2 className="text-2xl font-bold text-white mb-6">Statistiques</h2>
    <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 backdrop-blur-sm">
      {stats.totalRequests ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-700/50 p-4 rounded-lg border border-gray-600">
            <h3 className="text-blue-300 font-medium">Requêtes totales</h3>
            <p className="text-2xl font-bold text-white mt-1">{stats.totalRequests}</p>
          </div>
          <div className="bg-gray-700/50 p-4 rounded-lg border border-gray-600">
            <h3 className="text-green-300 font-medium">Requêtes ce mois</h3>
            <p className="text-2xl font-bold text-white mt-1">{stats.monthlyRequests}</p>
          </div>
          <div className="bg-gray-700/50 p-4 rounded-lg border border-gray-600">
            <h3 className="text-purple-300 font-medium">Taux de succès</h3>
            <p className="text-2xl font-bold text-white mt-1">{stats.successRate}%</p>
          </div>
        </div>
      ) : (
        <p className="text-gray-400">Chargement des statistiques...</p>
      )}
    </div>
  </div>
);

export default StatsContent;