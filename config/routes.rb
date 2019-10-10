Rails.application.routes.draw do
  root 'games#index'
  get 'hints' => 'hints#index'
end
