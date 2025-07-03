

const SecurityContent = ({ securityLogs }) => (
  <div>
    <h2 className="text-2xl font-bold text-white mb-6">Sécurité</h2>
    <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 backdrop-blur-sm">
      <h3 className="font-semibold text-white mb-4">Historique de connexion</h3>
      <div className="space-y-4">
        {securityLogs.length > 0 ? (
          securityLogs.map((log) => (
            <div key={log._id} className="p-3 border-b border-gray-700 last:border-0 hover:bg-gray-700/30 rounded">
              <div className="flex justify-between">
                <div>
                  <p className="font-medium text-white">{log.action}</p>
                  <p className="text-sm text-gray-400">{log.ip}</p>
                </div>
                <p className="text-sm text-gray-500">
                  {new Date(log.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-400">Aucun événement de sécurité enregistré</p>
        )}
      </div>
    </div>
  </div>
);

export default SecurityContent;