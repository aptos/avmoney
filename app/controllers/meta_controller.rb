class MetaController < ApplicationController
  respond_to :json

  def index
    @meta = { 'timestamp' => Time.now }

    @meta['months'] = Global.months.names
    @meta['month_select'] = {}
    @meta['months'].each_with_index do |item, index|
      @meta['month_select'][sprintf("%02d",index+1)] = sprintf("%02d",index+1) + "-" + item
    end

    @meta['states'] = Global.states.names

    if admin?
      @meta['admin'] = true
    end
    render :json => @meta
  end
end