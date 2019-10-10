class GamesController < ApplicationController
  include AbstractController::Rendering
  include ActionView::Layouts
  append_view_path "#{Rails.root}/app/views"

  def index
    render 'games/index'
  end
end
