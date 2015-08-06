AVMoney::Application.routes.draw do
	root :to => "pages#home"

  # Authentications
  match '/auth/:provider/callback' => 'sessions#create', via: [:get, :post]
  get '/signin' => 'sessions#new'
  get '/signin/:provider' => 'sessions#new'
  get '/signout' => 'sessions#destroy'
  get '/auth/failure' => 'pages#home'
  resources :identities

  resources :activities

  get "/invoices/stats" => 'invoices#stats'
  resources :invoices
  post "/invoices/:id" => 'invoices#update'
  delete "/invoices/:id" => 'invoices#delete'

  resources :payments
  resources :clients
  get "/clients/:id/next_invoice" => 'clients#next_invoice'
  get "/clients/:id/projects" => 'clients#projects'
  get "/clients/:id/projects_report" => 'clients#projects_report'
  post "/clients/:id/projects" => 'clients#update_project'

  # Special cashflow report
  get "cashflow" => 'payments#cashflow'

  # S3 upload signature server
  resources :signed_url, only: :index

  # serve some constants as meta
  resources :meta, only: :index

  # Catch any other routes and display our own 404
  get "*path", :to => "application#routing_error", via: [:get, :post]
end